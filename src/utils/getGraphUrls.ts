import { graphUrls } from "../graphql/constants";
import { SupportedChainId, SupportedDex } from "../types"

export function getGraphUrls(chainId: SupportedChainId, dex: SupportedDex, isGraphRequired?: boolean,
    ): {url: string, publishedUrl: string} {
    const url = graphUrls[chainId]![dex]?.url;
    const publishedUrl = graphUrls[chainId]![dex]?.publishedUrl.replace('[api-key]', process.env.SUBGRAPH_API_KEY || '[api-key]');
    if (!url || !publishedUrl) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);
    if (url === 'none' && isGraphRequired)  throw new Error(`Function not available for DEX ${dex} on chain ${chainId}`);
    return {url, publishedUrl};
}