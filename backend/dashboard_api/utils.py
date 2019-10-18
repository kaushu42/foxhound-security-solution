import datetime

from core.models import Log


def str_to_date(string):
    """
        Returns a datetime if the string can be converted to string.
        Else, return None
    """
    try:
        return datetime.datetime.strptime(string, '%Y-%m-%d')
    except ValueError:
        return None


def get_filters(request):
    """
        Obtain the filter data from the request
    """
    start_date = request.POST.get('start_date', None)
    end_date = request.POST.get('end_date', None)
    start_date = str_to_date(start_date)
    end_date = str_to_date(end_date)

    application = request.POST.get('application', None)
    source_zone = request.POST.get('source_zone', None)
    destination_zone = request.POST.get('destination_zone', None)

    response = {
        "start_date": start_date,
        "end_date": end_date,
        "application": application,
        "source_zone": source_zone,
        "destination_zone": destination_zone,
    }

    return response


def get_objects_with_matching_filters(request):
    filters = get_filters(request)
    start_date = filters['start_date']
    end_date = filters['end_date']
    application = filters['application']
    # source_zone = filters['source_zone']
    # destination_zone = filters['destination_zone']

    objects = Log.objects.all()
    if start_date:
        objects = objects.filter(date__gte=start_date)
    if end_date:
        objects = objects.filter(date__lte=end_date)
    if application:
        objects = objects.filter(application=application)
    return objects
