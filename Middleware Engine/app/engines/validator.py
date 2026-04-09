class ResponseValidator:

    def validate(self, response):

        if len(response) < 5:
            return "Invalid response generated."

        return response