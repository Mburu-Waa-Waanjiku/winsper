// components/TitleIssuingGrid.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, User, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import MotionWrapper from './MotionWrapper';

const TitleIssuingCard = ({ event }) => {
  const [imageError, setImageError] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const createImageSrc = (base64Data, mimeType) => {
    if (!base64Data || !mimeType) return null; 
    if (base64Data.startsWith('data:')) return base64Data;
    return `data:${mimeType};base64,${base64Data}`;
  };


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        {!imageError ? (
          <Image
            src={createImageSrc(event.images[0].base64Data, event.images[0].mimeType)}
            alt={event.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <FileText className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
            {getStatusIcon(event.status)}
            {event.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2 mb-4">
          {event.clientName && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{event.clientName}</span>
            </div>
          )}
          
          {event.projectName && (
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{event.projectName}</span>
            </div>
          )}
          
          {event.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Issue Date: {formatDate(event.issueDate)}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            By {event.author?.name || event.author?.email || 'Unknown'}
          </span>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const TitleIssuingGrid = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Title Issuing Events Found</h3>
        <p className="text-gray-600">
          There are no title issuing events available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <MotionWrapper
          effect="slideIn" 
          direction="up" 
          delay={0.4} 
          duration={0.8}
          key={event.id}
        >
          <Link  href={`${event.id}`}>
            <TitleIssuingCard event={event} />
          </Link>
        </MotionWrapper>
      ))}
    </div>
  );
};

export default TitleIssuingGrid;
