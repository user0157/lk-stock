import time
from collections import defaultdict

MAX_FAILS = 5          # 最大失败次数
WINDOW_SECONDS = 600   # 统计窗口：10分钟
BLOCK_SECONDS = 600    # 封禁时间：10分钟

# 记录失败时间
_fail_records = defaultdict(list)

# 被封禁的 IP
_blocked_ips = {}


def is_ip_blocked(ip: str) -> bool:
    """判断 IP 是否被封禁"""
    now = time.time()

    if ip in _blocked_ips:
        if now < _blocked_ips[ip]:
            return True
        # 封禁时间到，解封
        del _blocked_ips[ip]

    return False


def record_login_failure(ip: str) -> bool:
    """
    记录一次登录失败
    返回 True 表示触发封禁
    """
    now = time.time()

    _fail_records[ip].append(now)

    # 只保留窗口期内的失败记录
    _fail_records[ip] = [
        t for t in _fail_records[ip]
        if now - t <= WINDOW_SECONDS
    ]

    if len(_fail_records[ip]) >= MAX_FAILS:
        _blocked_ips[ip] = now + BLOCK_SECONDS
        _fail_records[ip].clear()
        return True

    return False


def clear_failures(ip: str):
    """登录成功后清除失败记录"""
    _fail_records.pop(ip, None)

def unblock_ip(ip: str):
    """手动解锁 IP"""
    _blocked_ips.pop(ip, None)
    _fail_records.pop(ip, None)
