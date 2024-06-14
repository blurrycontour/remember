""" Singleton Metaclass. """

class SingletonMeta(type):
    """Singleton metaclass. Ensures that only one instance of a class is created. """
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]
