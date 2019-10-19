from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['POST'])
def stats(request):
    ip = request.POST.get('ip', None)
    if ip is None:
        return
