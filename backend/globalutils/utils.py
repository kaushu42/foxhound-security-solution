from django.db.models.functions import (
    TruncDay, TruncMinute, TruncMonth, TruncHour)
from django.db.models import Sum


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
    print(queryset)
    for obj in queryset:
        day = obj['date'].date()
        activity_bytes_sent.append({
            "day": day,
            "value": obj['bytes_sent']
        })
        activity_bytes_received.append({
            "day": day,
            "value": obj['bytes_received']
        })

    return activity_bytes_sent, activity_bytes_received


def get_usage(queryset):
    bytes_sent = []
    bytes_received = []

    for obj in queryset:
        time = obj['date'].time()
        bytes_sent.append({'time': time, 'value': obj['bytes_sent']})
        bytes_received.append({'time': time, 'value': obj['bytes_received']})

    return bytes_sent, bytes_received
