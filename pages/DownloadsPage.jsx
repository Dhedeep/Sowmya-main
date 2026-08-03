import React, { useState } from 'react';
import { Search, Download, FileText, Image, Music, Video, Archive, Calendar, Filter } from 'lucide-react';

const DownloadsPage = ({ navigateTo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock downloads data
  const [downloads] = useState([
    {
      id: 1,
      name: 'Fashion Magazine - Fall 2023',
      type: 'pdf',
      size: '15.2 MB',
      downloadDate: '2023-10-15',
      expiryDate: '2024-10-15',
      downloadCount: 3,
      maxDownloads: 5,
      orderId: 'ORD-2023-001',
      thumbnail: 'https://picsum.photos/seed/mag1/100/140.jpg'
    },
    {
      id: 2,
      name: 'Style Guide eBook',
      type: 'pdf',
      size: '8.7 MB',
      downloadDate: '2023-10-28',
      expiryDate: '2024-10-28',
      downloadCount: 1,
      maxDownloads: 5,
      orderId: 'ORD-2023-002',
      thumbnail: 'https://picsum.photos/seed/ebook1/100/140.jpg'
    },
    {
      id: 3,
      name: 'Fashion Lookbook',
      type: 'image',
      size: '22.4 MB',
      downloadDate: '2023-11-02',
      expiryDate: '2024-11-02',
      downloadCount: 2,
      maxDownloads: 3,
      orderId: 'ORD-2023-003',
      thumbnail: 'https://picsum.photos/seed/lookbook1/100/140.jpg'
    },
    {
      id: 4,
      name: 'Brand Assets Pack',
      type: 'archive',
      size: '45.8 MB',
      downloadDate: '2023-11-05',
      expiryDate: '2024-11-05',
      downloadCount: 0,
      maxDownloads: 10,
      orderId: 'ORD-2023-004',
      thumbnail: 'https://picsum.photos/seed/assets1/100/140.jpg'
    },
    {
      id: 5,
      name: 'Fashion Video Tutorial',
      type: 'video',
      size: '156.3 MB',
      downloadDate: '2023-11-10',
      expiryDate: '2024-11-10',
      downloadCount: 1,
      maxDownloads: 3,
      orderId: 'ORD-2023-005',
      thumbnail: 'https://picsum.photos/seed/video1/100/140.jpg'
    }
  ]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText size={24} className="text-red-500" />;
      case 'image':
        return <Image size={24} className="text-green-500" />;
      case 'video':
        return <Video size={24} className="text-purple-500" />;
      case 'audio':
        return <Music size={24} className="text-brand-primary" />;
      case 'archive':
        return <Archive size={24} className="text-yellow-500" />;
      default:
        return <FileText size={24} className="text-gray-500" />;
    }
  };

  const getDownloadProgress = (downloadCount, maxDownloads) => {
    const percentage = (downloadCount / maxDownloads) * 100;
    return percentage;
  };

  const getProgressColor = (percentage) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || download.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (downloadId) => {
    // In a real app, this would trigger the actual download
    alert(`Downloading file with ID: ${downloadId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">My Downloads</h1>
        <p className="text-gray-600 dark:text-gray-400">Access your purchased digital products</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search downloads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all">All Files</option>
              <option value="pdf">PDF</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="archive">Archives</option>
            </select>
          </div>
        </div>
      </div>

      {/* Downloads Grid */}
      {filteredDownloads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDownloads.map((download) => {
            const progressPercentage = getDownloadProgress(download.downloadCount, download.maxDownloads);
            const remainingDownloads = download.maxDownloads - download.downloadCount;

            return (
              <div key={download.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={download.thumbnail}
                    alt={download.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md">
                    {getFileIcon(download.type)}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 dark:text-white line-clamp-2">{download.name}</h3>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{download.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order:</span>
                      <span>{download.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span>{download.expiryDate}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Downloads</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {download.downloadCount}/{download.maxDownloads}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(progressPercentage)}`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {remainingDownloads > 0
                        ? `${remainingDownloads} downloads remaining`
                        : 'No downloads remaining'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDownload(download.id)}
                    disabled={remainingDownloads <= 0}
                    className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${remainingDownloads > 0
                        ? 'bg-brand-primary text-white hover:opacity-90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                      }`}
                  >
                    <Download size={18} />
                    {remainingDownloads > 0 ? 'Download' : 'Limit Reached'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No downloads found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'You don\'t have any digital products to download yet'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={() => navigateTo('shop')}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Browse Digital Products
            </button>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-brand-primary/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Download Information</h3>
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>• Digital products can be downloaded multiple times until the limit is reached</li>
          <li>• Download links expire after one year from purchase date</li>
          <li>• For any issues with downloads, please contact our support team</li>
          <li>• Some files may require specific software to open (PDF reader, image viewer, etc.)</li>
        </ul>
      </div>
    </div>
  );
};

export default DownloadsPage;