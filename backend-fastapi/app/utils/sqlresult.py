from typing import Any, List, Tuple


def sqlresult_to_dict(result: Tuple, description: Tuple[Tuple, ...]) -> dict[str, Any]:
    return {label[0]: value for label, value in zip(description, result)}


def sqlresult_to_dictlist(
    results: List[Tuple], description: Tuple[Tuple, ...]
) -> List[dict[str, Any]]:
    return [sqlresult_to_dict(r, description) for r in results]
