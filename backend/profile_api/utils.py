import socket
import datetime


def _is_ip_valid(ip):
    try:
        socket.inet_aton(ip)
        return True
    except socket.error:
        return False


def get_ip_from_request(request):
    ip = request.POST.get('ip', '')
    if not _is_ip_valid(ip):
        return None
    return ip


def _get_day_index(date: datetime.datetime):
    day = date.weekday()
    return (day + 1) % 7


def _get_month_index(date: datetime.datetime):
    month = date.month
    return month - 1


def get_month_day_index(date: datetime.datetime):
    return _get_month_index(date), _get_day_index(date)
