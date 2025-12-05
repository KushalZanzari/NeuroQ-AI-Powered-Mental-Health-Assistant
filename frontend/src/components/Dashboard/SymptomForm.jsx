import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  HeartIcon, 
  MoonIcon, 
  BoltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const SymptomForm = ({ onSubmit, isLoading }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const moodRating = watch('mood_rating');
  const stressLevel = watch('stress_level');

  const symptomOptions = [
    'Anxiety or worry',
    'Depression or sadness',
    'Mood swings',
    'Sleep problems',
    'Concentration issues',
    'Social withdrawal',
    'Irritability',
    'Fatigue',
    'Appetite changes',
    'Panic attacks',
    'Obsessive thoughts',
    'Substance use'
  ];

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      selected_symptoms: selectedSymptoms,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Text Input */}
      <div>
        <label htmlFor="input_text" className="block text-sm font-medium text-foreground mb-2">
          How are you feeling today? Describe your thoughts and emotions.
        </label>
        <textarea
          {...register('input_text', {
            required: 'Please describe how you\'re feeling',
            minLength: {
              value: 10,
              message: 'Please provide more details (at least 10 characters)',
            },
          })}
          rows={4}
          className="input resize-none"
          placeholder="I've been feeling anxious lately and having trouble sleeping..."
        />
        {errors.input_text && (
          <p className="mt-1 text-sm text-red-600">{errors.input_text.message}</p>
        )}
      </div>

      {/* Symptom Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Select any symptoms you're experiencing:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {symptomOptions.map((symptom) => (
            <label
              key={symptom}
              className="flex items-center space-x-2 p-2 rounded-md border border-border hover:bg-accent cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedSymptoms.includes(symptom)}
                onChange={() => handleSymptomToggle(symptom)}
                className="rounded border-border text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-foreground">{symptom}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Mood Rating */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Overall mood (1 = Very low, 10 = Excellent)
        </label>
        <div className="flex items-center space-x-2">
          <HeartIcon className="h-5 w-5 text-red-500" />
          <input
            {...register('mood_rating', {
              required: 'Please rate your mood',
              min: 1,
              max: 10,
            })}
            type="range"
            min="1"
            max="10"
            className="flex-1"
          />
          <HeartIcon className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-foreground min-w-[2rem]">
            {moodRating || 5}
          </span>
        </div>
        {errors.mood_rating && (
          <p className="mt-1 text-sm text-red-600">{errors.mood_rating.message}</p>
        )}
      </div>

      {/* Sleep Hours */}
      <div>
        <label htmlFor="sleep_hours" className="block text-sm font-medium text-foreground mb-2">
          <MoonIcon className="h-4 w-4 inline mr-1" />
          Hours of sleep last night
        </label>
        <input
          {...register('sleep_hours', {
            min: 0,
            max: 24,
          })}
          type="number"
          min="0"
          max="24"
          step="0.5"
          className="input"
          placeholder="8"
        />
        {errors.sleep_hours && (
          <p className="mt-1 text-sm text-red-600">{errors.sleep_hours.message}</p>
        )}
      </div>

      {/* Stress Level */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Current stress level (1 = Very low, 10 = Extremely high)
        </label>
        <div className="flex items-center space-x-2">
          <BoltIcon className="h-5 w-5 text-green-500" />
          <input
            {...register('stress_level', {
              required: 'Please rate your stress level',
              min: 1,
              max: 10,
            })}
            type="range"
            min="1"
            max="10"
            className="flex-1"
          />
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          <span className="text-sm font-medium text-foreground min-w-[2rem]">
            {stressLevel || 5}
          </span>
        </div>
        {errors.stress_level && (
          <p className="mt-1 text-sm text-red-600">{errors.stress_level.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary w-full py-3"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Analyzing...
          </div>
        ) : (
          'Analyze My Mental Health'
        )}
      </button>
    </form>
  );
};

export default SymptomForm;
