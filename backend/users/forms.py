from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import FoxhoundUser


class FoxhoundUserCreationForm(UserCreationForm):

    class Meta:
        model = FoxhoundUser
        fields = ('username', 'email')


class FoxhoundUserChangeForm(UserChangeForm):

    class Meta:
        model = FoxhoundUser
        fields = ('username', 'email')
