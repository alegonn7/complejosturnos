import { IsString, IsOptional, IsHexColor, MaxLength } from 'class-validator';

export class CreateConfiguracionTemaDto {
  @IsString()
  complejoId: string;

  @IsString()
  @MaxLength(100)
  nombreMostrar: string;

  @IsHexColor()
  @IsOptional()
  colorPrimario?: string;

  @IsHexColor()
  @IsOptional()
  colorSecundario?: string;

  @IsHexColor()
  @IsOptional()
  colorAccent?: string;

  @IsHexColor()
  @IsOptional()
  colorFondo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  textoHeroPrincipal?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  textoHeroSecundario?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  textoFooter?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  textoWhatsApp?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  faviconUrl?: string;

  @IsString()
  @IsOptional()
  bannerHomeUrl?: string;

  @IsString()
  @IsOptional()
  bannerReservaUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  metaDescription?: string;

  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @IsString()
  @IsOptional()
  facebookUrl?: string;

  @IsString()
  @IsOptional()
  instagramUrl?: string;

  @IsString()
  @IsOptional()
  tiktokUrl?: string;

  @IsString()
  @IsOptional()
  fontFamily?: string;
}