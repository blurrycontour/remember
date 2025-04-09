from typing import Union
from fastapi.responses import JSONResponse

def json_response_wrapper(result:Union[dict,str], success:bool):
    """ Wrapper for JSONResponse """
    return JSONResponse(content=result, status_code=200 if success else 400)
