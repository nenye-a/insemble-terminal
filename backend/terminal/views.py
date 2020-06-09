from django.shortcuts import redirect


def redirect_view(request):
    response = redirect('http://localhost:4000/')
    return response
