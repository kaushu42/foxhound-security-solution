import socket
import json


def _is_ip_valid(ip):
    try:
        socket.inet_aton(ip)
        return True
    except socket.error:
        return False


def get_ip_from_request(request):
    try:
        ip = json.loads(request.body)
        if 'ip' in ip:
            return ip['ip']
    except Exception:
        pass
    if request.method == 'POST':
        ip = request.POST.get('ip', '')
    elif request.method == 'GET':
        ip = request.GET.get('ip', '')

    if not _is_ip_valid(ip):
        return None
    return ip
