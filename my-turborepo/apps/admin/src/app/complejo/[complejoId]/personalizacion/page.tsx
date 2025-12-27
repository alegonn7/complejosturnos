'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { ColorPicker } from '@/components/personalizacion/ColorPicker';
import { ImageUpload } from '@/components/personalizacion/ImageUpload';
import { useConfiguracionTema } from '@/hooks/useConfiguracionTema';
import { usePermissions } from '@/hooks/usePermissions';

function PersonalizacionContent({
    params
}: {
    params: { complejoId: string }
}) {
    const { complejoId } = params
    const router = useRouter();
    const { canEditComplejo } = usePermissions();

    const {
        configuracion,
        isLoading,
        actualizarConfiguracion,
        subirImagen,
    } = useConfiguracionTema(complejoId);

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombreMostrar: '',
        colorPrimario: '#0a0a0a',
        colorSecundario: '#404040',
        colorAccent: '#22c55e',
        colorFondo: '#ffffff',
        textoHeroPrincipal: '',
        textoHeroSecundario: '',
        textoFooter: '',
        textoWhatsApp: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        facebookUrl: '',
        instagramUrl: '',
        tiktokUrl: '',
    });

    const [activeTab, setActiveTab] = useState<
        'branding' | 'colores' | 'textos' | 'seo' | 'redes'
    >('branding');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Cargar datos al montar
    useEffect(() => {
        if (configuracion) {
            setFormData({
                nombreMostrar: configuracion.nombreMostrar || '',
                colorPrimario: configuracion.colorPrimario || '#0a0a0a',
                colorSecundario: configuracion.colorSecundario || '#404040',
                colorAccent: configuracion.colorAccent || '#22c55e',
                colorFondo: configuracion.colorFondo || '#ffffff',
                textoHeroPrincipal: configuracion.textoHeroPrincipal || '',
                textoHeroSecundario: configuracion.textoHeroSecundario || '',
                textoFooter: configuracion.textoFooter || '',
                textoWhatsApp: configuracion.textoWhatsApp || '',
                metaTitle: configuracion.metaTitle || '',
                metaDescription: configuracion.metaDescription || '',
                metaKeywords: configuracion.metaKeywords || '',
                facebookUrl: configuracion.facebookUrl || '',
                instagramUrl: configuracion.instagramUrl || '',
                tiktokUrl: configuracion.tiktokUrl || '',
            });
        }
    }, [configuracion]);

    // Verificar permisos
    if (!canEditComplejo) {
        return (
            <DashboardLayout title="Sin Permisos">
                <Alert variant="error">
                    No tienes permisos para editar la personalización
                </Alert>
            </DashboardLayout>
        );
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await actualizarConfiguracion.mutateAsync(formData);
            setSuccess('Cambios guardados correctamente');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar cambios');
        }
    };

    const handleUploadLogo = async (file: File) => {
        const url = await subirImagen.mutateAsync({ file, tipo: 'logo' });
        await actualizarConfiguracion.mutateAsync({ logoUrl: url });
        return url;
    };

    const handleUploadFavicon = async (file: File) => {
        const url = await subirImagen.mutateAsync({ file, tipo: 'favicon' });
        await actualizarConfiguracion.mutateAsync({ faviconUrl: url });
        return url;
    };

    const handleUploadBanner = async (file: File) => {
        const url = await subirImagen.mutateAsync({ file, tipo: 'banner' });
        await actualizarConfiguracion.mutateAsync({ bannerHomeUrl: url });
        return url;
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Personalización">
                <div className="py-12">
                    <LoadingSpinner />
                </div>
            </DashboardLayout>
        );
    }

    const tabs = [
        { id: 'branding', label: 'Branding', icon: '🎨' },
        { id: 'colores', label: 'Colores', icon: '🌈' },
        { id: 'textos', label: 'Textos', icon: '📝' },
        { id: 'seo', label: 'SEO', icon: '🔍' },
        { id: 'redes', label: 'Redes Sociales', icon: '📱' },
    ];

    return (
        <DashboardLayout
            title="Personalización"
            subtitle="Personaliza la apariencia de tu sitio web"
        >
            {/* Alerts */}
            {success && (
                <Alert variant="success" className="mb-6">
                    {success}
                </Alert>
            )}
            {error && (
                <Alert variant="error" className="mb-6">
                    {error}
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Tabs laterales */}
                <Card className="lg:col-span-1">
                    <CardBody>
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                    w-full text-left px-4 py-3 rounded-lg transition-colors
                    flex items-center gap-3
                    ${activeTab === tab.id
                                            ? 'bg-primary text-white'
                                            : 'text-primary-600 hover:bg-primary-50'
                                        }
                  `}
                                >
                                    <span className="text-xl">{tab.icon}</span>
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </CardBody>
                </Card>

                {/* Contenido del tab activo */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <h2 className="text-lg font-semibold">
                            {tabs.find((t) => t.id === activeTab)?.label}
                        </h2>
                    </CardHeader>

                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* TAB: BRANDING */}
                            {activeTab === 'branding' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            Nombre a Mostrar
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.nombreMostrar}
                                            onChange={(e) =>
                                                handleChange('nombreMostrar', e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md"
                                            maxLength={100}
                                        />
                                        <p className="text-xs text-primary-600 mt-1">
                                            Este nombre aparecerá en el sitio público
                                        </p>
                                    </div>

                                    <ImageUpload
                                        label="Logo"
                                        currentImage={configuracion?.logoUrl}
                                        onUpload={handleUploadLogo}
                                        description="Recomendado: PNG o SVG transparente, máx 5MB"
                                    />

                                    <ImageUpload
                                        label="Favicon"
                                        currentImage={configuracion?.faviconUrl}
                                        onUpload={handleUploadFavicon}
                                        accept=".ico,.png"
                                        description="Icono que aparece en la pestaña del navegador"
                                    />

                                    <ImageUpload
                                        label="Banner Principal"
                                        currentImage={configuracion?.bannerHomeUrl}
                                        onUpload={handleUploadBanner}
                                        description="Banner que aparece en la página de inicio"
                                    />
                                </div>
                            )}

                            {/* TAB: COLORES */}
                            {activeTab === 'colores' && (
                                <div className="space-y-6">
                                    <ColorPicker
                                        label="Color Primario"
                                        value={formData.colorPrimario}
                                        onChange={(color) => handleChange('colorPrimario', color)}
                                        description="Color principal de botones y elementos destacados"
                                    />

                                    <ColorPicker
                                        label="Color Secundario"
                                        value={formData.colorSecundario}
                                        onChange={(color) =>
                                            handleChange('colorSecundario', color)
                                        }
                                        description="Color para textos secundarios y bordes"
                                    />

                                    <ColorPicker
                                        label="Color de Acento"
                                        value={formData.colorAccent}
                                        onChange={(color) => handleChange('colorAccent', color)}
                                        description="Color para estados de éxito y confirmaciones"
                                    />

                                    <ColorPicker
                                        label="Color de Fondo"
                                        value={formData.colorFondo}
                                        onChange={(color) => handleChange('colorFondo', color)}
                                        description="Color de fondo general del sitio"
                                    />

                                    {/* Preview */}
                                    <div className="mt-8 p-6 border-2 border-dashed border-primary-200 rounded-lg">
                                        <p className="text-sm font-medium text-primary-700 mb-4">
                                            Vista Previa
                                        </p>
                                        <div className="space-y-3">
                                            <button
                                                type="button"
                                                style={{ backgroundColor: formData.colorPrimario }}
                                                className="px-4 py-2 text-white rounded-md"
                                            >
                                                Botón Primario
                                            </button>
                                            <p style={{ color: formData.colorSecundario }}>
                                                Texto secundario de ejemplo
                                            </p>
                                            <div
                                                style={{
                                                    backgroundColor: formData.colorAccent,
                                                    padding: '12px',
                                                    borderRadius: '6px',
                                                    color: 'white',
                                                }}
                                            >
                                                Elemento con color de acento
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: TEXTOS */}
                            {activeTab === 'textos' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            Texto Hero Principal
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.textoHeroPrincipal}
                                            onChange={(e) =>
                                                handleChange('textoHeroPrincipal', e.target.value)
                                            }
                                            placeholder="Reservá tu cancha en segundos"
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md"
                                            maxLength={100}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            Texto Hero Secundario
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.textoHeroSecundario}
                                            onChange={(e) =>
                                                handleChange('textoHeroSecundario', e.target.value)
                                            }
                                            placeholder="Fútbol 5, pádel y más deportes"
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md"
                                            maxLength={200}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            Texto Footer
                                        </label>
                                        <textarea
                                            value={formData.textoFooter}
                                            onChange={(e) =>
                                                handleChange('textoFooter', e.target.value)
                                            }
                                            placeholder="Horarios, información de contacto..."
                                            rows={4}
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md resize-none"
                                            maxLength={500}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            Mensaje WhatsApp Pre-cargado
                                        </label>
                                        <textarea
                                            value={formData.textoWhatsApp}
                                            onChange={(e) =>
                                                handleChange('textoWhatsApp', e.target.value)
                                            }
                                            placeholder="Hola! Quiero consultar por..."
                                            rows={3}
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md resize-none"
                                            maxLength={300}
                                        />
                                        <p className="text-xs text-primary-600 mt-1">
                                            Este mensaje aparecerá pre-cargado al abrir WhatsApp
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* TAB: SEO */}
                            {activeTab === 'seo' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            Meta Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.metaTitle}
                                            onChange={(e) =>
                                                handleChange('metaTitle', e.target.value)
                                            }
                                            placeholder="Complejo Norte - Reservá Online"
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md"
                                            maxLength={60}
                                        />
                                        <p className="text-xs text-primary-600 mt-1">
                                            {formData.metaTitle.length}/60 caracteres
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            Meta Description
                                        </label>
                                        <textarea
                                            value={formData.metaDescription}
                                            onChange={(e) =>
                                                handleChange('metaDescription', e.target.value)
                                            }
                                            placeholder="Descripción que aparece en Google..."
                                            rows={3}
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md resize-none"
                                            maxLength={160}
                                        />
                                        <p className="text-xs text-primary-600 mt-1">
                                            {formData.metaDescription.length}/160 caracteres
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            Keywords (separadas por coma)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.metaKeywords}
                                            onChange={(e) =>
                                                handleChange('metaKeywords', e.target.value)
                                            }
                                            placeholder="cancha, fútbol 5, reserva online, pádel"
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB: REDES SOCIALES */}
                            {activeTab === 'redes' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            Facebook
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.facebookUrl}
                                            onChange={(e) =>
                                                handleChange('facebookUrl', e.target.value)
                                            }
                                            placeholder="https://facebook.com/tupage"
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            Instagram
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.instagramUrl}
                                            onChange={(e) =>
                                                handleChange('instagramUrl', e.target.value)
                                            }
                                            placeholder="https://instagram.com/tupage"
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary-700 mb-2">
                                            TikTok
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.tiktokUrl}
                                            onChange={(e) =>
                                                handleChange('tiktokUrl', e.target.value)
                                            }
                                            placeholder="https://tiktok.com/@tupage"
                                            className="w-full px-4 py-2 border border-primary-200 rounded-md"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex items-center justify-between pt-6 border-t border-primary-200">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.push(`/complejo/${complejoId}`)}
                                >
                                    Cancelar
                                </Button>

                                <div className="flex items-center gap-3">
                                    <a
                                        href={`http://localhost:3002/${configuracion?.complejoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button type="button" variant="secondary">
                                            Vista Previa
                                        </Button>
                                    </a>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={actualizarConfiguracion.isPending}
                                    >
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </DashboardLayout >
    );
}

export default function PersonalizacionPage({
    params,
}: {
    params: { complejoId: string };
}) {
    return (
        <ProtectedRoute>
            <PersonalizacionContent params={params} />
        </ProtectedRoute>
    );
}