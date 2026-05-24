# Debug Session: db-pool-timeout
- **Status**: [FIXED]
- **Issue**: 访问首页时出现 `DriverAdapterError: pool timeout`，页面直接报错而不是平稳降级。
- **Debug Server**: Pending
- **Log File**: .dbg/trae-debug-log-db-pool-timeout.ndjson

## Reproduction Steps
1. 启动本地开发服务。
2. 访问首页或购物车页。
3. 数据库侧触发连接额度/连接池异常时，页面出现运行时报错。

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | 数据库账号触发主机资源限制，Prisma 查询直接抛错且未被兜底处理 | High | Low | Confirmed |
| B | `readStoreData()` 每次并发读取 4 组数据，在受限连接下更容易触发超时 | High | Low | Supported |
| C | `layout`、`page` 等多处重复调用 `readStoreData()`，放大了连接消耗 | Medium | Low | Supported |
| D | Prisma 适配器或客户端实例重复创建，导致连接未复用 | Low | Medium | Rejected |

## Log Evidence
- `.dbg/trae-debug-log-db-pool-timeout.ndjson:1-2` 显示 `DriverAdapterError` 后立即触发 `fallback to local store`。
- `.dbg/trae-debug-log-db-pool-timeout.ndjson:3-8` 再次复现时，同样先报 `pool timeout`，随后进入 fallback，没有出现新的未处理分支。
- 开发服务器日志显示底层数据库返回 `max_connections_per_hour`，说明根因在数据库连接额度，而非前端渲染。

## Verification Conclusion
- 已确认根因是数据库侧连接额度超限导致 `readStoreData()` 抛出 `DriverAdapterError`。
- 已增加可恢复错误兜底：命中连接池/额度错误时返回 `fallbackStore`，避免页面 Runtime Error。
- 已对 `readStoreData()` 增加请求级缓存，减少同一请求内重复读取店铺数据。
