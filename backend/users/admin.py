from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from .forms import FoxhoundUserCreationForm, FoxhoundUserChangeForm
from .models import FoxhoundUser


class FoxhoundUserAdmin(UserAdmin):
    add_form = FoxhoundUserCreationForm
    form = FoxhoundUserChangeForm
    model = FoxhoundUser
    list_display = ['id', 'email', 'username', 'tenant']
    fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'first_name',
                'last_name', 'is_superuser', 'tenant'
            )
        }
        ),
    )


admin.site.register(FoxhoundUser, FoxhoundUserAdmin)
