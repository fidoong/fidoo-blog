import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    // 检查 code 是否唯一
    if (createMenuDto.code) {
      const existing = await this.menuRepository.findOne({
        where: { code: createMenuDto.code },
      });
      if (existing) {
        throw new BadRequestException('菜单编码已存在');
      }
    }

    // 检查父菜单是否存在
    if (createMenuDto.parentId) {
      const parent = await this.menuRepository.findOne({
        where: { id: createMenuDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('父菜单不存在');
      }
    }

    const menu = this.menuRepository.create(createMenuDto);
    return await this.menuRepository.save(menu);
  }

  async findAll(): Promise<Menu[]> {
    return await this.menuRepository.find({
      where: {},
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findTree(): Promise<Menu[]> {
    const menus = await this.menuRepository.find({
      where: { parentId: IsNull() },
      relations: ['children'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    // 递归加载子菜单
    const loadChildren = async (menu: Menu) => {
      const children = await this.menuRepository.find({
        where: { parentId: menu.id },
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });
      menu.children = children;
      for (const child of children) {
        await loadChildren(child);
      }
    };

    for (const menu of menus) {
      await loadChildren(menu);
    }

    return menus;
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);

    // 检查 code 是否唯一
    if (updateMenuDto.code && updateMenuDto.code !== menu.code) {
      const existing = await this.menuRepository.findOne({
        where: { code: updateMenuDto.code },
      });
      if (existing) {
        throw new BadRequestException('菜单编码已存在');
      }
    }

    // 检查父菜单是否存在且不能是自己
    if (updateMenuDto.parentId) {
      if (updateMenuDto.parentId === id) {
        throw new BadRequestException('不能将自己设为父菜单');
      }
      const parent = await this.menuRepository.findOne({
        where: { id: updateMenuDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('父菜单不存在');
      }
    }

    Object.assign(menu, updateMenuDto);
    return await this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);

    // 检查是否有子菜单
    const children = await this.menuRepository.find({
      where: { parentId: id },
    });
    if (children.length > 0) {
      throw new BadRequestException('存在子菜单，无法删除');
    }

    await this.menuRepository.remove(menu);
  }

  async findByRoleIds(roleIds: string[]): Promise<Menu[]> {
    if (roleIds.length === 0) {
      return [];
    }

    return await this.menuRepository
      .createQueryBuilder('menu')
      .innerJoin('menu.roleMenus', 'roleMenu')
      .where('roleMenu.roleId IN (:...roleIds)', { roleIds })
      .andWhere('menu.status = :status', { status: 'enabled' })
      .orderBy('menu.sortOrder', 'ASC')
      .getMany();
  }
}

