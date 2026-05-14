using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace PMS.Lib;

public static class RedisExtensions
{
    public static async Task SetRecord<T>(this IDistributedCache cache, string key, T data, TimeSpan expiryTime)
    {
        var json = JsonSerializer.Serialize(data);
        await cache.SetStringAsync(key, json, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiryTime
        });
    }

    public static async Task<T?> GetRecord<T>(this IDistributedCache cache, string key)
    {
        var json = await cache.GetStringAsync(key);
        return json == null ? default : JsonSerializer.Deserialize<T>(json);
    }
}
