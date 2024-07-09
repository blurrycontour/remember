from fastapi.responses import JSONResponse

def json_response_wrapper(result, success):
    """ Wrapper for JSONResponse """
    return JSONResponse(content=result, status_code=200 if success else 400)
