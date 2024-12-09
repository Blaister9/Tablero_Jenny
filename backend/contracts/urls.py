# backend/contracts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContractViewSet,
    kpis_full_summary,
    contratistas_options,
    rubros_options,
    anios_options,
    adiciones_stats,
    supervisores_stats,
    sistemas_info_stats,
    filters_options,
    estados_stats,
    contracts_list
)

router = DefaultRouter()
router.register('contracts', ContractViewSet, basename='contracts')

urlpatterns = [
    path('', include(router.urls)),
    path('kpis-full-summary/', kpis_full_summary, name='kpis-full-summary'),
    path('contratistas-options/', contratistas_options, name='contratistas-options'),
    path('rubros-options/', rubros_options, name='rubros-options'),
    path('anios-options/', anios_options, name='anios-options'),
    path('adiciones-stats/', adiciones_stats, name='adiciones-stats'),
    path('supervisores-stats/', supervisores_stats, name='supervisores-stats'),
    path('sistemas-info-stats/', sistemas_info_stats, name='sistemas-info-stats'),
    path('filters-options/', filters_options, name='filters-options'),
    path('estados-stats/', estados_stats, name='estados-stats'),
    path('contracts-list/', contracts_list, name='contracts-list'),
]
