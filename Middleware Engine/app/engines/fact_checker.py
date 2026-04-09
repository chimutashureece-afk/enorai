class FactChecker:

    def verify(self, response, context):

        if not context:
            return response

        if isinstance(context, list):
            context_text = " ".join(context).lower()
        else:
            context_text = str(context).lower()

        response_text = response.lower()

        if context_text not in response_text:
            return response + "\n\n"

        return response