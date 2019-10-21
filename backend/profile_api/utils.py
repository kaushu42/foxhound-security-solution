import socket


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
