import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from .models import Job, Application, User
import re
from collections import Counter
import json
from decimal import Decimal

class JobRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.scaler = StandardScaler()
        self.job_features = None
        self.user_profiles = {}
    
    def preprocess_text(self, text):
        """Clean and preprocess text data"""
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def extract_features(self, jobs):
        """Extract features from job data for recommendation"""
        job_data = []
        job_ids = []
        
        for job in jobs:
            # Combine relevant text fields
            text_data = f"{job.title} {job.description} {job.requirements} {job.location}"
            text_data += f" {job.created_by.company if job.created_by.company else ''}"
            
            # Convert Decimal to float for salary
            salary_feature = float(job.salary) if job.salary else 0.0
            
            job_data.append({
                'text': self.preprocess_text(text_data),
                'salary': salary_feature,
                'id': job.id
            })
            job_ids.append(job.id)
        
        # TF-IDF for text features
        texts = [jd['text'] for jd in job_data]
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        
        # Salary features
        salaries = np.array([jd['salary'] for jd in job_data]).reshape(-1, 1)
        salaries_normalized = self.scaler.fit_transform(salaries)
        
        # Combine features
        self.job_features = {
            job_id: {
                'tfidf': tfidf_matrix[i],
                'salary': salaries_normalized[i][0],
                'job_data': job_data[i]
            }
            for i, job_id in enumerate(job_ids)
        }
        
        return self.job_features
    
    def build_user_profile(self, user):
        """Build a user profile based on their applications and preferences"""
        if user.id in self.user_profiles:
            return self.user_profiles[user.id]
        
        # Get user's applications
        applications = Application.objects.filter(applicant=user)
        
        # Extract preferences from applied jobs
        preferred_keywords = []
        preferred_salaries = []
        preferred_companies = []
        preferred_locations = []
        
        for app in applications:
            job = app.job
            # Extract keywords from job title and description
            text = f"{job.title} {job.description}"
            words = self.preprocess_text(text).split()
            preferred_keywords.extend(words)
            
            if job.salary:
                # Convert Decimal to float
                preferred_salaries.append(float(job.salary))
            if job.created_by.company:
                preferred_companies.append(job.created_by.company)
            if job.location:
                preferred_locations.append(job.location)
        
        # Create user profile
        user_profile = {
            'preferred_keywords': dict(Counter(preferred_keywords).most_common(20)),
            'average_salary': np.mean(preferred_salaries) if preferred_salaries else 0.0,
            'preferred_companies': dict(Counter(preferred_companies).most_common(10)),
            'preferred_locations': dict(Counter(preferred_locations).most_common(10)),
            'application_count': len(applications)
        }
        
        self.user_profiles[user.id] = user_profile
        return user_profile
    
    def calculate_similarity(self, user_profile, job_features, all_jobs):
        """Calculate similarity between user profile and jobs"""
        similarities = []
        
        for job in all_jobs:
            if job.id not in job_features:
                continue
                
            features = job_features[job.id]
            similarity_score = 0.0
            
            # Text similarity (TF-IDF)
            if user_profile['preferred_keywords']:
                # Create user preference vector
                user_pref_text = ' '.join(user_profile['preferred_keywords'].keys())
                user_vector = self.vectorizer.transform([user_pref_text])
                text_similarity = cosine_similarity(user_vector, features['tfidf'])[0][0]
                similarity_score += text_similarity * 0.4
            
            # Salary similarity
            if user_profile['average_salary'] > 0 and features['salary'] > 0:
                salary_diff = abs(user_profile['average_salary'] - features['salary'])
                salary_similarity = 1.0 / (1.0 + salary_diff)
                similarity_score += salary_similarity * 0.3
            
            # Company preference
            job_company = job.created_by.company if job.created_by else None
            if job_company and job_company in user_profile['preferred_companies']:
                company_score = user_profile['preferred_companies'][job_company] / max(1, user_profile['application_count'])
                similarity_score += company_score * 0.2
            
            # Location preference
            if job.location and job.location in user_profile['preferred_locations']:
                location_score = user_profile['preferred_locations'][job.location] / max(1, user_profile['application_count'])
                similarity_score += location_score * 0.1
            
            similarities.append((job, similarity_score))
        
        return similarities
    
    def recommend_jobs(self, user, max_recommendations=6):
        """Get job recommendations for a user"""
        try:
            # Get all active jobs
            all_jobs = list(Job.objects.filter(is_active=True))
            
            if not all_jobs:
                return []
            
            # Extract features if not already done
            if self.job_features is None or len(self.job_features) != len(all_jobs):
                self.extract_features(all_jobs)
            
            # Build user profile
            user_profile = self.build_user_profile(user)
            
            # Calculate similarities
            similarities = self.calculate_similarity(user_profile, self.job_features, all_jobs)
            
            # Sort by similarity score
            similarities.sort(key=lambda x: x[1], reverse=True)
            
            # Get top recommendations
            recommendations = [job for job, score in similarities[:max_recommendations] if score > 0]
            
            return recommendations
            
        except Exception as e:
            print(f"Error in recommendation engine: {e}")
            # Fallback: return newest jobs
            return list(Job.objects.filter(is_active=True).order_by('-created_at')[:max_recommendations])

# Global recommender instance
job_recommender = JobRecommender()