# project/extractors/__init__.py
from .rule_based import RuleBasedExtractor
from .ai_based import AIBasedExtractor

def get_extractor(engine):
    if engine == 'rule_based':
        return RuleBasedExtractor()
    elif engine == 'ai_based':
        return AIBasedExtractor()
    else:
        raise ValueError(f'Unknown extraction engine: {engine}')