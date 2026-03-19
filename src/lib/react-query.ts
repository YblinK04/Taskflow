import { QueryClient, QueryFunction } from '@tanstack/react-query';

// базовый запрос

async function throwOfResNotOk(res: Response) {
    if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error (`${res.status}: ${text}`);
    }
}

export async function customFetch<T>({
    url,
    method,
    body,
    headers,
}: {
    url: string;
    method: string;
    body?: any;
    headers?: any;
}): Promise<T> {
 const res = await fetch(url, {
    method,
    headers: {
        'Content-Type': 'application/json',
        ...headers,
    },
        body: method !== 'GET' && body ? JSON.stringify(body) : undefined
});

    await throwOfResNotOk(res)
    return res.json()
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: async ({queryKey}) => {
                const res = await fetch(queryKey[0] as string, {
                    credentials: 'include',
                });

                if (!res.ok) {
                    throw new Error(`Network response was not ok (${res.status})`)
                }

                return res.json()
            },
             refetchOnWindowFocus: process.env.NODE_ENV === 'production',
             retry: (failureCount, error: any) => {
                // запрос не повторится при 404 или 403
                if (error?.message?.includes('404') || error?.message?.includes('403')) {
                    return false
                }
                return failureCount < 3
             },
        },
        mutations: {
            retry: false
        }
    }
});

// Вспомогательные функции для запросов
export const api = {
  get: <T>(url: string) => customFetch<T>({ url, method: 'GET' }),
  post: <T>(url: string, body?: any) => customFetch<T>({ url, method: 'POST', body }),
  put: <T>(url: string, body?: any) => customFetch<T>({ url, method: 'PUT', body }),
  delete: <T>(url: string) => customFetch<T>({ url, method: 'DELETE' }),
  patch: <T>(url: string, body?: any) => customFetch<T>({ url, method: 'PATCH', body }),
};