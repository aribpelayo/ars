from django.db import models

class Image(models.Model):
    name = models.CharField(max_length=30)
    suggested = models.CharField(max_length=30, blank=True, null= True)
    image = models.CharField(max_length=120)
    retrain = models.IntegerField(blank=True, null= True)
    clase = models.CharField(max_length=1000, blank=True, null= True)
    score = models.IntegerField(blank=True, null= True)