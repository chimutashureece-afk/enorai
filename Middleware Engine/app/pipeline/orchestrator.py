from app.engines.prompt_security import PromptSecurity
from app.engines.anonymizer import Anonymizer
from app.engines.safety import SafetyValidator
from app.engines.retriever import Retriever
from app.engines.guardrails import Guardrails
from app.engines.validator import ResponseValidator
from app.engines.fact_checker import FactChecker
from app.engines.scoring import QualityScorer
from app.llm.openai_client import OpenAIClient


class LLMPipeline:

    def __init__(self):

        self.security = PromptSecurity()
        self.anonymizer = Anonymizer()
        self.safety = SafetyValidator()
        self.retriever = Retriever()
        self.guardrails = Guardrails()
        self.llm = OpenAIClient()
        self.validator = ResponseValidator()
        self.fact_checker = FactChecker()
        self.scorer = QualityScorer()

    def run(self, prompt):

        # Security checks
        prompt = self.security.check(prompt)

        # Remove PII
        prompt = self.anonymizer.clean(prompt)

        # Safety validation
        prompt = self.safety.validate(prompt)

        # Retrieve context (RAG)
        context = self.retriever.retrieve(prompt)

        # Guardrails
        final_prompt = self.guardrails.apply(prompt, context)

        # EnorAi
        response = self.llm.generate(final_prompt)

        # Validation
        response = self.validator.validate(response)

        # Factcheking
        response = self.fact_checker.verify(response, context)

        if not response or "i don't know" in response.lower():

            response = self.llm.generate(
                f"Answer the user's question clearly, safely and helpfully:\n\n{prompt}"
            )

        # Scoring
        score = self.scorer.score(response)

        return {
            "response": response,
            "score": score
        }