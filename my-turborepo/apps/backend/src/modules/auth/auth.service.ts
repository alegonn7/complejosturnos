import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { telefono: registerDto.telefono },
    });

    if (existingUser) {
      throw new ConflictException('El teléfono ya está registrado');
    }

    if (registerDto.email) {
      const existingEmail = await this.prisma.usuario.findUnique({
        where: { email: registerDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        telefono: registerDto.telefono,
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        email: registerDto.email,
        dni: registerDto.dni,
        password: hashedPassword,
        rol: 'CLIENTE',
      },
      select: {
        id: true,
        email: true,
        telefono: true,
        nombre: true,
        apellido: true,
        rol: true,
      },
    });

    const token = this.generateToken(usuario.id);

    return {
      usuario,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { telefono: loginDto.telefono },
    });

    if (!usuario || !usuario.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, usuario.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(usuario.id);

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        telefono: usuario.telefono,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
      access_token: token,
    };
  }

  async getProfile(userId: string) {
    return await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        telefono: true,
        dni: true,
        nombre: true,
        apellido: true,
        rol: true,
        complejoId: true,
        createdAt: true,
      },
    });
  }

  private generateToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }
}