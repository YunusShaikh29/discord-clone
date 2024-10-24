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

  
  const fetchMessages = async ({ pageParam = null }) => {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor: pageParam, // pagination cursor
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Failed to fetch messages");
    }

    const data = await res.json();

    
    console.log("Fetched Messages:", data);
    console.log("isConnected", isConnected)

    return data;
  };

  // paginated data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isError,
    isLoading
  } = useInfiniteQuery({
    queryKey: [queryKey], 
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null, // Return null if no next page
    initialPageParam: null, // Set initial page param to null for the first page
    refetchInterval: isConnected ? false : 1000, // using polling here
  });


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
