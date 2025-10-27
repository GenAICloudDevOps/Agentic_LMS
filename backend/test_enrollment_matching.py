"""
Test enrollment matching to ensure correct courses are matched
"""
import asyncio


# Mock courses
MOCK_COURSES = [
    {"id": 1, "title": "Introduction to Artificial Intelligence", "category": "AI", "difficulty": "Beginner"},
    {"id": 2, "title": "Advanced Machine Learning with Python", "category": "AI", "difficulty": "Advanced"},
    {"id": 3, "title": "Deep Learning and Neural Networks", "category": "AI", "difficulty": "Advanced"},
    {"id": 4, "title": "AI Ethics and Society", "category": "AI", "difficulty": "Intermediate"},
    {"id": 5, "title": "Machine Learning Basics", "category": "AI", "difficulty": "Beginner"},
]


def test_enrollment_matching():
    """Test various enrollment scenarios"""
    
    test_cases = [
        {
            "message": "enroll for AI Ethics and Society and Machine Learning Basics",
            "expected": ["AI Ethics and Society", "Machine Learning Basics"],
            "should_not_match": ["Introduction to Artificial Intelligence", "Advanced Machine Learning with Python"]
        },
        {
            "message": "enroll me in Introduction to AI",
            "expected": ["Introduction to Artificial Intelligence"],
            "should_not_match": ["AI Ethics and Society"]
        },
        {
            "message": "I want to take Machine Learning Basics",
            "expected": ["Machine Learning Basics"],
            "should_not_match": ["Advanced Machine Learning with Python"]
        },
        {
            "message": "enroll in Advanced Machine Learning with Python",
            "expected": ["Advanced Machine Learning with Python"],
            "should_not_match": ["Machine Learning Basics"]
        },
        {
            "message": "sign me up for Deep Learning and Neural Networks",
            "expected": ["Deep Learning and Neural Networks"],
            "should_not_match": []
        },
    ]
    
    print("="*60)
    print("ENROLLMENT MATCHING TESTS")
    print("="*60)
    
    for i, test in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test['message']}")
        print(f"Expected: {test['expected']}")
        
        # Simulate matching logic
        message_lower = test['message'].lower()
        matched_courses = []
        
        for course in MOCK_COURSES:
            course_title_lower = course["title"].lower()
            
            # Check if full course title is mentioned
            if course_title_lower in message_lower:
                matched_courses.append(course["title"])
                continue
            
            # Extract meaningful words
            title_words = [w for w in course_title_lower.split() if w not in ['to', 'the', 'and', 'with', 'for', 'from', 'a', 'an', 'in', 'of', 'on']]
            
            # Check for abbreviation matches (standalone words only)
            message_words = message_lower.split()
            abbreviations = {
                "ai": ["artificial", "intelligence"],
                "ml": ["machine", "learning"],
            }
            
            matched_via_abbr = False
            for abbr, full_words in abbreviations.items():
                if abbr in message_words:
                    if all(word in course_title_lower for word in full_words):
                        # Check for specific words
                        specific_words = ["ethics", "basics", "introduction", "advanced", "deep", "neural"]
                        has_specific = any(word in message_lower for word in specific_words)
                        
                        if not has_specific or any(word in course_title_lower for word in specific_words if word in message_lower):
                            matched_courses.append(course["title"])
                            matched_via_abbr = True
                            break
            
            if matched_via_abbr:
                continue
            
            # Check for keyword matches (need 2-3 words)
            if len(title_words) >= 2:
                matched_words = [word for word in title_words if word in message_lower]
                min_matches = 3 if len(title_words) >= 4 else 2
                
                if len(matched_words) >= min_matches:
                    positions = []
                    for word in matched_words[:min_matches]:
                        if word in message_words:
                            positions.append(message_words.index(word))
                    
                    if len(positions) >= min_matches:
                        max_distance = max(positions) - min(positions)
                        if max_distance <= 5:
                            matched_courses.append(course["title"])
        
        # Check results
        print(f"Matched: {matched_courses}")
        
        # Verify expected matches
        all_expected_found = all(exp in matched_courses for exp in test['expected'])
        no_wrong_matches = all(wrong not in matched_courses for wrong in test['should_not_match'])
        
        if all_expected_found and no_wrong_matches:
            print("✅ PASS")
        else:
            print("❌ FAIL")
            if not all_expected_found:
                missing = [exp for exp in test['expected'] if exp not in matched_courses]
                print(f"   Missing: {missing}")
            if not no_wrong_matches:
                wrong = [wrong for wrong in test['should_not_match'] if wrong in matched_courses]
                print(f"   Wrong matches: {wrong}")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    test_enrollment_matching()
