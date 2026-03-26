import { trpc } from "@/shared/lib/trpc";

export function useChannels() {
  const utils = trpc.useUtils();
  const connectionsQuery = trpc.channels.listConnections.useQuery();

  const connectPage = trpc.channels.connectPage.useMutation({
    onSuccess: () => utils.channels.listConnections.invalidate(),
  });

  const disconnect = trpc.channels.disconnect.useMutation({
    onSuccess: () => utils.channels.listConnections.invalidate(),
  });

  const connectInstagram = trpc.channels.connectInstagram.useMutation({
    onSuccess: () => utils.channels.listConnections.invalidate(),
  });

  const syncCatalog = trpc.channels.syncCatalog.useMutation({
    onSuccess: () => utils.channels.listConnections.invalidate(),
  });

  return {
    connections: connectionsQuery.data ?? [],
    isLoading: connectionsQuery.isLoading,
    connectPage,
    connectInstagram,
    disconnect,
    syncCatalog,
  };
}
