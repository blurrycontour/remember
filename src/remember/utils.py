import traceback


def try_except_decorator(error_msg="Error", except_return_value=False):
    """ A decorator to catch exceptions and print the error message """
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                print(f"{error_msg}: {e}")
                print(traceback.format_exc())
                return except_return_value
        return wrapper
    return decorator
