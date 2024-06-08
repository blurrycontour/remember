def to_html(*args:str):
    sub_html_str = ""
    for arg in args:
        sub_html_str += f'<div class="centered">{arg}</div>'

    html_str = f"""
    <html>
        <head>
            <title>Home</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Itim&display=swap" rel="stylesheet">
            <style>
                body {{
                    font-family: "Itim", sans-serif;
                }}
                .centered {{
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                    height: 5%;
                    width: 100%;
                    # border: 3px solid black;
                }}
            </style>
        </head>
        <body>
            <div class="centered"></div>
            <div class="centered"></div>
            {sub_html_str}
        </body>
    </html>
    """
    return html_str
