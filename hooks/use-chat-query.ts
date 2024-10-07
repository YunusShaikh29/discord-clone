import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
}

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const { isConnected } = useSocket();

  // Fetch messages function for react-query
  const fetchMessages = async ({ pageParam = null }) => {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor: pageParam, // Handle pagination cursor
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    // Fetch the response
    const res = await fetch(url);

    // Check if the response is OK, otherwise throw an error
    if (!res.ok) {
      throw new Error("Failed to fetch messages");
    }

    const data = await res.json();

    // Log the response data for debugging purposes
    console.log("Fetched Messages:", data);

    return data;
  };

  // Use react-query's useInfiniteQuery to fetch paginated data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isError,
    isLoading
  } = useInfiniteQuery({
    queryKey: [queryKey, paramKey, paramValue], // Ensure that queryKey includes all relevant params
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null, // Return null if no next page
    refetchInterval: isConnected ? false : 1000, // Fetch messages every 1 second if not connected
    initialPageParam: null, // Set initial page param to null for the first page
  });

  // Return necessary values for component usage
  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isError,
    isLoading
  };
};
