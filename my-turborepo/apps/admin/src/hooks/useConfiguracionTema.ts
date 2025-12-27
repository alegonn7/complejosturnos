import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ConfiguracionTema {
  id: string;
  complejoId: string;
  logoUrl?: string;
  faviconUrl?: string;
  nombreMostrar: string;
  colorPrimario: string;
  colorSecundario: string;
  colorAccent: string;
  colorFondo: string;
  textoHeroPrincipal?: string;
  textoHeroSecundario?: string;
  textoFooter?: string;
  textoWhatsApp?: string;
  bannerHomeUrl?: string;
  bannerReservaUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  fontFamily?: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateConfiguracionTemaDto {
  nombreMostrar?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  colorAccent?: string;
  colorFondo?: string;
  textoHeroPrincipal?: string;
  textoHeroSecundario?: string;
  textoFooter?: string;
  textoWhatsApp?: string;
  logoUrl?: string;
  faviconUrl?: string;
  bannerHomeUrl?: string;
  bannerReservaUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  fontFamily?: string;
}

export function useConfiguracionTema(complejoId: string) {
  const queryClient = useQueryClient();

  // Query: Obtener configuración
  const { data: configuracion, isLoading } = useQuery({
    queryKey: ['configuracion-tema', complejoId],
    queryFn: async () => {
      const { data } = await api.get<ConfiguracionTema>(
        `/configuracion-tema/complejo/${complejoId}`
      );
      return data;
    },
    enabled: !!complejoId,
  });

  // Mutation: Actualizar configuración
  const actualizarConfiguracion = useMutation({
    mutationFn: async (datos: UpdateConfiguracionTemaDto) => {
      const { data } = await api.patch(
        `/configuracion-tema/complejo/${complejoId}`,
        datos
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['configuracion-tema', complejoId] 
      });
    },
  });

  // Mutation: Subir imagen
  const subirImagen = useMutation({
    mutationFn: async ({ 
      file, 
      tipo 
    }: { 
      file: File; 
      tipo: 'logo' | 'favicon' | 'banner' 
    }) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post(`/upload/${tipo}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return data.url;
    },
  });

  return {
    configuracion,
    isLoading,
    actualizarConfiguracion,
    subirImagen,
  };
}