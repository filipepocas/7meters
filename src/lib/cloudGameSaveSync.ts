import type { Session } from '@supabase/supabase-js';
import {
  getSavedGameSnapshot,
  isValidSavedGameState,
  readLocalGameSave,
  removeLocalGameSave,
  useGameStore,
  writeLocalGameSave,
  type SavedGameState,
  type UserAccount,
} from '../store/useGameStore';
import { supabase } from './supabase';

const SAVE_DEBOUNCE_MS = 2000;

let started = false;
let activeSessionId: string | null | undefined;
let hydratedUserId: string | null = null;
let lastSyncedSnapshot: string | null = null;
let pendingSnapshot: string | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function toUserAccount(session: Session): UserAccount {
  const user = session.user;
  const metadataName = user.user_metadata?.name;

  return {
    id: user.id,
    email: user.email ?? '',
    name: typeof metadataName === 'string' && metadataName.trim()
      ? metadataName.trim()
      : 'Treinador de Andebol',
    isAdmin: user.app_metadata?.is_admin === true,
    isLoggedIn: true,
  };
}

async function uploadSave(userId: string, state: SavedGameState): Promise<void> {
  if (!supabase) return;

  const serializedState = JSON.stringify(state);
  const { data, error } = await supabase
    .from('game_saves')
    .upsert({ user_id: userId, state }, { onConflict: 'user_id' })
    .select('updated_at')
    .single();

  if (error) throw error;
  lastSyncedSnapshot = serializedState;
  writeLocalGameSave(state, data.updated_at, userId);
  removeLocalGameSave(null);
  useGameStore.getState().setCloudSaveStatus('saved');
}

async function restoreOrUploadSave(userId: string): Promise<void> {
  if (!supabase) return;

  const { data, error } = await supabase
    .from('game_saves')
    .select('state, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  const localSave = readLocalGameSave(userId);
  if (data) {
    if (!isValidSavedGameState(data.state) || !Number.isFinite(Date.parse(data.updated_at))) {
      throw new Error('O save cloud tem um formato inválido. O save local foi preservado.');
    }

    const localIsNewer =
      localSave &&
      !localSave.legacy &&
      Date.parse(localSave.savedAt) > Date.parse(data.updated_at);
    if (localIsNewer) {
      await uploadSave(userId, localSave.state);
      return;
    }

    useGameStore.setState(data.state);
    writeLocalGameSave(data.state, data.updated_at, userId);
    if (!localSave?.legacy) removeLocalGameSave(null);
    lastSyncedSnapshot = JSON.stringify(data.state);
    useGameStore.getState().setCloudSaveStatus('saved');
    return;
  }

  if (!localSave) {
    useGameStore.getState().resetGameUniverse();
    useGameStore.getState().setCloudSaveStatus('local');
    return;
  }

  const localState = localSave.state;
  if (localState.userClub) {
    await uploadSave(userId, localState);
  } else {
    lastSyncedSnapshot = JSON.stringify(localState);
    useGameStore.getState().setCloudSaveStatus('local');
  }
}

function cancelPendingSave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
  pendingSnapshot = null;
}

async function applySession(session: Session | null): Promise<void> {
  const userId = session?.user.id ?? null;
  if (userId === activeSessionId) return;

  activeSessionId = userId;
  hydratedUserId = null;
  lastSyncedSnapshot = null;
  cancelPendingSave();

  if (!session) {
    useGameStore.getState().setCurrentUser(null);
    useGameStore.getState().setCloudSaveStatus('local');
    useGameStore.getState().setCloudReady(true);
    return;
  }

  useGameStore.getState().setCurrentUser(toUserAccount(session));
  useGameStore.getState().setCloudReady(false);
  useGameStore.getState().setCloudSaveStatus('syncing');

  try {
    await restoreOrUploadSave(session.user.id);
    if (activeSessionId !== session.user.id) return;
    hydratedUserId = session.user.id;
  } catch (error) {
    if (activeSessionId !== session.user.id) return;
    useGameStore.getState().setCloudSaveStatus('error');
    console.error('Cloud save sync failed; local progress is preserved.', error);
  } finally {
    if (activeSessionId === session.user.id) {
      useGameStore.getState().setCloudReady(true);
    }
  }
}

export function startCloudGameSaveSync(): void {
  if (started) return;
  started = true;

  if (!supabase) {
    useGameStore.getState().setCloudReady(true);
    return;
  }

  useGameStore.subscribe((state) => {
    const userId = state.currentUser?.id;
    if (!userId || userId !== hydratedUserId || !state.userClub) return;

    const snapshot = getSavedGameSnapshot();
    const serializedSnapshot = JSON.stringify(snapshot);
    if (serializedSnapshot === lastSyncedSnapshot || serializedSnapshot === pendingSnapshot) return;

    pendingSnapshot = serializedSnapshot;
    if (saveTimer) clearTimeout(saveTimer);
    state.setCloudSaveStatus('syncing');

    saveTimer = setTimeout(() => {
      saveTimer = null;
      pendingSnapshot = null;
      if (useGameStore.getState().currentUser?.id !== userId) return;

      void uploadSave(userId, snapshot).catch((error: unknown) => {
        useGameStore.getState().setCloudSaveStatus('error');
        console.error('Cloud save sync failed; local progress is preserved.', error);
      });
    }, SAVE_DEBOUNCE_MS);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    queueMicrotask(() => void applySession(session));
  });

  void supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      useGameStore.getState().setCloudSaveStatus('error');
      useGameStore.getState().setCloudReady(true);
      console.error('Could not restore the Supabase session.', error);
      return;
    }
    return applySession(data.session);
  });
}
