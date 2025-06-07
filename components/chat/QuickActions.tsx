'use client';

interface QuickActionsProps {
  onQuickAction: (message: string) => void;
  disabled?: boolean;
}

const quickActions = [
  {
    id: 'symptoms',
    label: 'Symptom Checker',
    message: 'I have some symptoms I\'d like to discuss. Can you help me understand what they might mean?',
    icon: '🩺',
    color: 'bg-red-100 text-red-700 hover:bg-red-200'
  },
  {
    id: 'wellness',
    label: 'Wellness Tips',
    message: 'Can you give me some general wellness and health tips for maintaining good health?',
    icon: '💪',
    color: 'bg-green-100 text-green-700 hover:bg-green-200'
  },
  {
    id: 'nutrition',
    label: 'Nutrition Advice',
    message: 'I\'d like some advice about healthy eating and nutrition. What should I know?',
    icon: '🥗',
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
  },
  {
    id: 'exercise',
    label: 'Exercise Guidance',
    message: 'Can you provide guidance on safe and effective exercise routines for general health?',
    icon: '🏃‍♂️',
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  {
    id: 'mental-health',
    label: 'Mental Health',
    message: 'I\'d like to discuss mental health and stress management techniques. Can you help?',
    icon: '🧠',
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  },
  {
    id: 'medication',
    label: 'Medication Info',
    message: 'I have questions about medications and their general effects. Can you provide information?',
    icon: '💊',
    color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
  }
];

export default function QuickActions({ onQuickAction, disabled = false }: QuickActionsProps) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onQuickAction(action.message)}
            disabled={disabled}
            className={`p-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg">{action.icon}</span>
              <span>{action.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}