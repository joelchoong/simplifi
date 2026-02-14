# Supabase Rate Limiting Configuration Guide

## Overview

This document provides instructions for configuring rate limiting in your Supabase project to prevent abuse, reduce costs, and ensure fair usage.

## Why Rate Limiting?

- **Prevent DDoS attacks**: Limit requests from malicious users
- **Control costs**: Avoid unexpected bills from excessive API usage
- **Fair usage**: Ensure all users get reasonable access
- **Protect infrastructure**: Prevent service degradation from traffic spikes

---

## Supabase Dashboard Configuration

### Authentication Rate Limits

1. Navigate to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Rate Limits**

#### Recommended Settings:

| Endpoint | Rate Limit | Reasoning |
|----------|------------|-----------|
| **Sign Up** | 5 requests/hour per IP | Prevent fake account creation |
| **Sign In** | 30 requests/hour per IP | Allow legitimate retries, block brute force |
| **Password Reset** | 5 requests/hour per email | Prevent abuse of email service |
| **Email Verification** | 10 requests/hour per user | Allow resends, prevent spam |
| **Phone Verification** | 5 requests/hour per phone | Prevent SMS abuse |

#### How to Configure:

```sql
-- Sign Up Rate Limit
-- In Supabase Dashboard: Authentication → Rate Limits
-- Set: 5 requests per hour per IP address

-- Sign In Rate Limit  
-- Set: 30 requests per hour per IP address

-- Password Reset
-- Set: 5 requests per hour per email address
```

---

### Database Rate Limits

> **Note**: Database rate limiting is available on Pro plan and above. Free tier projects should implement client-side throttling.

1. Go to **Settings** → **Database** → **Connection Pooling**
2. Configure connection limits:
   - **Max Connections**: 15 (free tier) / 50+ (paid)
   - **Pool Size**: 1-3 connections per instance

#### Row Level Security (RLS) as Rate Limiting

Your current RLS policies already provide some protection:

```sql
-- profiles table policy (already implemented)
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id);
```

---

## Client-Side Rate Limiting

### Using the useDebounce Hook

We've implemented `useDebounce` hook to prevent rapid-fire API calls.

#### Example Usage in Save Operations:

```typescript
import { useDebounce } from "@/shared/hooks/useDebounce";

const MyComponent = () => {
  const [income, setIncome] = useState(0);
  const debouncedIncome = useDebounce(income, 1000); // 1 second delay

  useEffect(() => {
    // Only saves after user stops typing for 1 second
    if (debouncedIncome) {
      saveToDatabase(debouncedIncome);
    }
  }, [debouncedIncome]);
};
```

---

## Monitoring Rate Limits

### Supabase Logs

1. Go to **Logs** → **API Logs**
2. Filter for status codes:
   - `429` - Too Many Requests (rate limit hit)
   - `401` - Unauthorized
   - `403` - Forbidden

### Setting Up Alerts

1. Go to **Reports** → **API Usage**
2. Set up email alerts for:
   - API usage exceeds 80% of quota
   - Unusual spike in requests (>3x normal)
   - High error rate (>5% of requests)

---

## Rate Limit Response Handling

### Frontend Implementation

```typescript
// Error handling for rate limits
const handleSave = async (data: any) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', userId);

    if (error) {
      // Check for rate limit error
      if (error.message.includes('rate limit')) {
        toast({
          title: "Too many requests",
          description: "Please wait a moment before trying again.",
          variant: "destructive",
        });
        return;
      }
      
      throw error;
    }
  } catch (error) {
    // Handle error
  }
};
```

---

## Best Practices

### 1. Implement Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a rate limit error
      if (error.message.includes('429')) {
        // Wait for 2^i seconds before retrying
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError!;
}
```

### 2. Batch Operations

Instead of making multiple individual requests, batch them:

```typescript
// ❌ BAD: Multiple requests
for (const item of items) {
  await supabase.from('table').insert(item);
}

// ✅ GOOD: Single batch request
await supabase.from('table').insert(items);
```

### 3. Cache Frequently Accessed Data

```typescript
// Use React Query or SWR for caching
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => fetchProfile(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

---

## Testing Rate Limits

### Manual Testing

```bash
# Test sign-in rate limit (requires curl)
for i in {1..35}; do
  curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \\
    -H 'apikey: your-anon-key' \\
    -H 'Content-Type: application/json' \\
    -d '{"email":"test@example.com","password":"wrong"}' \\
    --silent -w "Request $i: %{http_code}\\n" -o /dev/null
done

# Expected: First 30 requests return 400, subsequent return 429
```

### Automated Testing

Add rate limit tests to your test suite:

```typescript
describe('Rate Limiting', () => {
  it('should rate limit sign-in attempts', async () => {
    const attempts = Array(35).fill(null).map(() =>
      signIn('test@test.com', 'wrong-password')
    );
    
    const results = await Promise.all(attempts);
    const rateLimited = results.filter(r => r.status === 429);
    
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

---

## Troubleshooting

### Users Hitting Rate Limits Legitimately

If legitimate users are hitting rate limits:

1. **Increase limits**: Adjust in Supabase Dashboard
2. **Add caching**: Reduce unnecessary requests
3. **Optimize queries**: Use fewer, more efficient queries
4. **Request quota increase**: Contact Supabase support

### Rate Limits Not Working

1. Verify configuration in Supabase Dashboard
2. Check your plan tier (some features require Pro)
3. Ensure using correct API endpoints
4. Review Supabase logs for configuration errors

---

## Current Implementation Status

- [x] Client-side debouncing implemented (`useDebounce` hook)
- [ ] Supabase auth rate limits configured (manual step required)
- [ ] Database connection pooling optimized
- [ ] Rate limit monitoring alerts configured
- [ ] Exponential backoff implemented
- [ ] Rate limit tests added

---

## Next Steps

1. **Configure Supabase Rate Limits**:
   - Log in to Supabase Dashboard
   - Set authentication rate limits as described above
   - Enable connection pooling limits

2. **Test Configuration**:
   - Attempt rapid sign-in attempts
   - Verify 429 responses after limit
   - Check Supabase logs

3. **Monitor Usage**:
   - Set up email alerts
   - Review API usage weekly
   - Adjust limits based on real usage

4. **Document Changes**:
   - Update team on new limits
   - Add to onboarding documentation

---

## Additional Resources

- [Supabase Rate Limiting Docs](https://supabase.com/docs/guides/platform/going-into-prod#rate-limiting)
- [Supabase Auth Rate Limits](https://supabase.com/docs/guides/auth/auth-rate-limits)
- [Database Connection Pooling](https://supabase.com/docs/guides/database/connection-pooling)
