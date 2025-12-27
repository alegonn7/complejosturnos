import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
  }
  onModuleInit() {
  }
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

    const { identifier, password, rememberMe } = loginDto;

    const isEmail = identifier.includes('@');

    const usuario = await this.prisma.usuario.findFirst({
      where: isEmail
        ? { email: identifier }
        : { telefono: identifier },
    });

    if (!usuario || !usuario.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Token con expiración acorde
    const token = this.generateToken(usuario.id, rememberMe);

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

  private generateToken(userId: string, rememberMe = false): string {
    const payload = { sub: userId };
    const expiresIn = rememberMe ? '30d' : '1d';

    return this.jwtService.sign(payload, { expiresIn });
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

}