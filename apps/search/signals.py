from haystack import signals
from haystack.exceptions import NotHandled


class RealtimeRemoveSignalProcessor(signals.RealtimeSignalProcessor):
    """
    Reimplemented RealtimeSignalProcessor because for some reason it doesn't
    respect the index_queryset filters
    """

    def handle_save(self, sender, instance, **kwargs):
        using_backends = self.connection_router.for_write(instance=instance)

        for using in using_backends:
            try:
                index = self.connections[using].get_unified_index().get_index(sender)

                index.update_object(instance, using=using)

                in_the_index_queryset = index.index_queryset().filter(pk=instance.pk).all()

                if not in_the_index_queryset:
                    index.remove_object(instance, using=using)

            except NotHandled:
                # TODO: Maybe log it or let the exception bubble?
                pass