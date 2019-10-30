from django.db.models.functions import (
    TruncDay, TruncMinute, TruncMonth, TruncHour)
from django.db.models import Sum
from django.db.models import Q
from core.models import TrafficLogDetail


def _get_day_index(date):
    day = date.weekday()
    return (day + 1) % 7


def _get_month_index(date):
    month = date.month
    return month - 1


def get_month_day_index(date):
    return _get_month_index(date), _get_day_index(date)


_TRUNC_TIME = {
    'month': TruncMonth,
    'day': TruncDay,
    'hour': TruncHour,
    'minute': TruncMinute
}


def groupby_date(queryset, input_field, timeinterval, output_fields):
    trunc_func = _TRUNC_TIME[timeinterval.lower()]
    query = {}
    for field in output_fields:
        query[field] = Sum(field)

    return queryset.annotate(
        date=trunc_func(
            input_field
        )
    ).values(
        'date'
    ).annotate(**query).values('date', *output_fields)


def get_activity(queryset):
    activity_bytes_sent = []
    activity_bytes_received = []
    for obj in queryset:
        day = obj['date'].date()
        activity_bytes_sent.append({
            "day": day,
            "value": format(obj['bytes_sent']/(1024*1024), '.2f')
        })
        activity_bytes_received.append({
            "day": day,
            "value": format(obj['bytes_received']/(1024*1024), '.2f')
        })

    return activity_bytes_sent, activity_bytes_received


def get_usage(queryset):
    bytes_sent = []
    bytes_received = []
    times = []
    for obj in queryset:
        time = obj['date']
        times.append(time)
        bytes_sent.append(obj['bytes_sent'])
        bytes_received.append(obj['bytes_received'])

    return times, bytes_sent, bytes_received


def get_filters(request):
    """
        Obtain the filter data from the request
    """
    start_date = request.POST.get('start_date', None)
    end_date = request.POST.get('end_date', None)
    start_date = str_to_date(start_date)
    end_date = str_to_date(end_date)
    firewall_rule = request.POST.get('firewall_rule', None)
    application = request.POST.get('application', None)
    protocol = request.POST.get('protocol', None)
    source_zone = request.POST.get('source_zone', None)
    destination_zone = request.POST.get('destination_zone', None)

    response = {
        "start_date": (start_date),
        "end_date": (end_date),
        "firewall_rule": (firewall_rule),
        "application": (application),
        "protocol": (protocol),
        "source_zone": (source_zone),
        "destination_zone": (destination_zone),
    }
    return response


def str_to_date(string):
    """
        Returns a datetime if the string can be converted to string.
        Else, return None
    """
    try:
        return datetime.datetime.strptime(string, '%Y-%m-%d')
    except Exception:
        return None


def _get_query(name, item):
    item = item.split(',')
    q = {name: item.pop(0)}
    result = Q(**q)
    for i in item:
        q[name] = i
        result |= Q(**q)
    return result


def get_query_from_request(request):
    filters = get_filters(request)
    start_date = filters['start_date']
    end_date = filters['end_date']
    firewall_rule = filters['firewall_rule']
    application = filters['application']
    protocol = filters['protocol']
    source_zone = filters['source_zone']
    destination_zone = filters['destination_zone']

    queries = []
    if start_date:
        start_date_query = Q(traffic_log__log_date__gte=start_date)
        queries.append(start_date_query)

    if end_date:
        end_date_query = Q(traffic_log__log_date__lte=end_date)
        queries.append(end_date_query)

    if firewall_rule:
        firewall_rule_query = _get_query('firewall_rule', firewall_rule)
        queries.append(firewall_rule_query)

    if application:
        application_query = _get_query('application', application)
        queries.append(application_query)

    if protocol:
        protocol_query = _get_query('protocol', protocol)
        queries.append(protocol_query)

    if source_zone:
        source_zone_query = _get_query('source_zone', source_zone)
        queries.append(source_zone_query)

    if destination_zone:
        destination_zone_query = _get_query(
            'destination_zone', destination_zone)
        queries.append(destination_zone_query)
    return queries


def get_objects_from_query(queries):
    if queries:
        result = queries.pop(0)
        for query in queries:
            result &= query
        return TrafficLogDetail.objects.filter(result)

    return TrafficLogDetail.objects.filter()
