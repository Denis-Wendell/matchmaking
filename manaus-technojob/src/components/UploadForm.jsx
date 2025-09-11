// components/UploadForm.jsx
import { useState } from 'react';
import Button from './Button';

function UploadForm({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Por favor, selecione apenas arquivos PDF');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      // Aqui faria upload para API
      const mockResult = {
        skills: ['React', 'JavaScript', 'Node.js', 'Python'],
        experiencia: 3,
        nivel: 'Pleno'
      };
      
      setTimeout(() => {
        setResult(mockResult);
        setUploading(false);
        if (onUpload) onUpload(mockResult);
      }, 2000);
      
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="resume-upload"
        />
        <label htmlFor="resume-upload" className="cursor-pointer">
          <div className="text-gray-600">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-lg">Clique para selecionar seu currículo</p>
            <p className="text-sm text-gray-500">Apenas arquivos PDF</p>
          </div>
        </label>
      </div>

      {file && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-medium">📄 {file.name}</p>
          <p className="text-blue-600 text-sm">
            Tamanho: {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      <Button 
        onClick={handleUpload}
        loading={uploading}
        disabled={!file}
        className="w-full"
      >
        {uploading ? 'Analisando com IA...' : 'Enviar Currículo'}
      </Button>

      {result && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">✅ Análise Concluída!</h4>
          <div className="space-y-2">
            <div>
              <strong>Skills identificadas:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <p><strong>Experiência:</strong> {result.experiencia} anos</p>
            <p><strong>Nível:</strong> {result.nivel}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadForm;