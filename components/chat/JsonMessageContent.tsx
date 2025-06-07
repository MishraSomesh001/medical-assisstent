'use client';

interface JsonResponse {
  greeting: string;
  mainContent: {
    summary: string;
    keyPoints: string[];
    recommendations: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  whenToSeekHelp: {
    urgentSigns: string[];
    consultDoctor: string[];
  };
  disclaimer: string;
  supportiveClosing: string;
}

interface JsonMessageContentProps {
  content: string | JsonResponse;
  isUser: boolean;
}

export default function JsonMessageContent({ content, isUser }: JsonMessageContentProps) {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{typeof content === 'string' ? content : JSON.stringify(content)}</p>;
  }

  // Handle string content (fallback for non-JSON responses)
  if (typeof content === 'string') {
    return (
      <div className="ai-response">
        <p className="text-gray-800 leading-relaxed">{content}</p>
      </div>
    );
  }

  // Handle JSON structured content
  const jsonContent = content as JsonResponse;

  return (
    <div className="ai-response space-y-4">
      {/* Greeting */}
      {jsonContent.greeting && (
        <div className="text-gray-800 font-medium">
          {jsonContent.greeting}
        </div>
      )}

      {/* Main Content */}
      {jsonContent.mainContent && (
        <div className="space-y-4">
          {/* Summary */}
          {jsonContent.mainContent.summary && (
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              <p className="text-gray-800 leading-relaxed">{jsonContent.mainContent.summary}</p>
            </div>
          )}

          {/* Key Points */}
          {jsonContent.mainContent.keyPoints && jsonContent.mainContent.keyPoints.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                📋 Key Information
              </h4>
              <ul className="space-y-2">
                {jsonContent.mainContent.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-gray-800 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {jsonContent.mainContent.recommendations && jsonContent.mainContent.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                ✅ Recommendations
              </h4>
              <div className="space-y-3">
                {jsonContent.mainContent.recommendations.map((rec, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl flex-shrink-0">{rec.icon}</span>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">{rec.title}</h5>
                        <p className="text-gray-700 text-sm leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* When to Seek Help */}
      {jsonContent.whenToSeekHelp && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            🚨 When to Seek Medical Help
          </h4>
          
          {jsonContent.whenToSeekHelp.urgentSigns && jsonContent.whenToSeekHelp.urgentSigns.length > 0 && (
            <div className="mb-3">
              <h5 className="font-medium text-red-700 mb-2">⚠️ Urgent Signs (Seek immediate care):</h5>
              <ul className="space-y-1">
                {jsonContent.whenToSeekHelp.urgentSigns.map((sign, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2 mt-1 flex-shrink-0">•</span>
                    <span className="text-gray-800 text-sm">{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {jsonContent.whenToSeekHelp.consultDoctor && jsonContent.whenToSeekHelp.consultDoctor.length > 0 && (
            <div>
              <h5 className="font-medium text-orange-700 mb-2">🏥 Consult a Doctor if:</h5>
              <ul className="space-y-1">
                {jsonContent.whenToSeekHelp.consultDoctor.map((situation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2 mt-1 flex-shrink-0">•</span>
                    <span className="text-gray-800 text-sm">{situation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      {jsonContent.disclaimer && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm leading-relaxed">
            <span className="font-medium">⚠️ Medical Disclaimer:</span> {jsonContent.disclaimer}
          </p>
        </div>
      )}

      {/* Supportive Closing */}
      {jsonContent.supportiveClosing && (
        <div className="text-gray-800 font-medium text-center p-2 bg-blue-50 rounded-lg">
          {jsonContent.supportiveClosing}
        </div>
      )}
    </div>
  );
}