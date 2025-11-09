import dataSource from '../data-source';
import { Dictionary, DictionaryType, DictionaryStatus } from '@/modules/dictionaries/entities/dictionary.entity';

async function initDictionaries() {
  try {
    console.log('正在连接数据库...');
    await dataSource.initialize();
    console.log('数据库连接成功');

    const dictRepo = dataSource.getRepository(Dictionary);

    // 检查是否已有字典数据
    const existingCount = await dictRepo.count();
    if (existingCount > 0) {
      console.log('⚠️  字典数据已存在，跳过初始化');
      console.log(`   当前已有 ${existingCount} 条字典记录`);
      await dataSource.destroy();
      return;
    }

    console.log('创建字典数据...');

    // 1. 创建国家字典（树形结构）
    const countryDict = dictRepo.create({
      name: '国家',
      code: 'country',
      type: DictionaryType.TREE,
      label: '国家',
      value: 'root', // 根节点使用 'root' 作为 value
      sortOrder: 1,
      status: DictionaryStatus.ENABLED,
      description: '国家字典（树形结构）',
      isSystem: true,
    });
    await dictRepo.save(countryDict);

    // 创建主要国家
    const countries = [
      { name: '中国', code: 'CN', value: 'CN', sortOrder: 1 },
      { name: '美国', code: 'US', value: 'US', sortOrder: 2 },
      { name: '日本', code: 'JP', value: 'JP', sortOrder: 3 },
      { name: '韩国', code: 'KR', value: 'KR', sortOrder: 4 },
      { name: '英国', code: 'GB', value: 'GB', sortOrder: 5 },
      { name: '法国', code: 'FR', value: 'FR', sortOrder: 6 },
      { name: '德国', code: 'DE', value: 'DE', sortOrder: 7 },
      { name: '加拿大', code: 'CA', value: 'CA', sortOrder: 8 },
      { name: '澳大利亚', code: 'AU', value: 'AU', sortOrder: 9 },
      { name: '俄罗斯', code: 'RU', value: 'RU', sortOrder: 10 },
    ];

    const savedCountries = [];
    for (const country of countries) {
      const countryEntity = dictRepo.create({
        name: country.name,
        code: `country:${country.code}`,
        type: DictionaryType.TREE,
        parentId: countryDict.id,
        label: country.name,
        value: country.value,
        sortOrder: country.sortOrder,
        status: DictionaryStatus.ENABLED,
        description: `${country.name}（${country.code}）`,
        isSystem: true,
      });
      const saved = await dictRepo.save(countryEntity);
      savedCountries.push(saved);
    }

    // 2. 创建中国省份（作为中国的子项）
    const chinaCountry = savedCountries.find((c) => c.value === 'CN');
    if (chinaCountry) {
      const provinces = [
        { name: '北京市', code: 'BJ', value: '110000', sortOrder: 1 },
        { name: '天津市', code: 'TJ', value: '120000', sortOrder: 2 },
        { name: '河北省', code: 'HE', value: '130000', sortOrder: 3 },
        { name: '山西省', code: 'SX', value: '140000', sortOrder: 4 },
        { name: '内蒙古自治区', code: 'NM', value: '150000', sortOrder: 5 },
        { name: '辽宁省', code: 'LN', value: '210000', sortOrder: 6 },
        { name: '吉林省', code: 'JL', value: '220000', sortOrder: 7 },
        { name: '黑龙江省', code: 'HL', value: '230000', sortOrder: 8 },
        { name: '上海市', code: 'SH', value: '310000', sortOrder: 9 },
        { name: '江苏省', code: 'JS', value: '320000', sortOrder: 10 },
        { name: '浙江省', code: 'ZJ', value: '330000', sortOrder: 11 },
        { name: '安徽省', code: 'AH', value: '340000', sortOrder: 12 },
        { name: '福建省', code: 'FJ', value: '350000', sortOrder: 13 },
        { name: '江西省', code: 'JX', value: '360000', sortOrder: 14 },
        { name: '山东省', code: 'SD', value: '370000', sortOrder: 15 },
        { name: '河南省', code: 'HA', value: '410000', sortOrder: 16 },
        { name: '湖北省', code: 'HB', value: '420000', sortOrder: 17 },
        { name: '湖南省', code: 'HN', value: '430000', sortOrder: 18 },
        { name: '广东省', code: 'GD', value: '440000', sortOrder: 19 },
        { name: '广西壮族自治区', code: 'GX', value: '450000', sortOrder: 20 },
        { name: '海南省', code: 'HI', value: '460000', sortOrder: 21 },
        { name: '重庆市', code: 'CQ', value: '500000', sortOrder: 22 },
        { name: '四川省', code: 'SC', value: '510000', sortOrder: 23 },
        { name: '贵州省', code: 'GZ', value: '520000', sortOrder: 24 },
        { name: '云南省', code: 'YN', value: '530000', sortOrder: 25 },
        { name: '西藏自治区', code: 'XZ', value: '540000', sortOrder: 26 },
        { name: '陕西省', code: 'SN', value: '610000', sortOrder: 27 },
        { name: '甘肃省', code: 'GS', value: '620000', sortOrder: 28 },
        { name: '青海省', code: 'QH', value: '630000', sortOrder: 29 },
        { name: '宁夏回族自治区', code: 'NX', value: '640000', sortOrder: 30 },
        { name: '新疆维吾尔自治区', code: 'XJ', value: '650000', sortOrder: 31 },
        { name: '香港特别行政区', code: 'HK', value: '810000', sortOrder: 32 },
        { name: '澳门特别行政区', code: 'MO', value: '820000', sortOrder: 33 },
        { name: '台湾省', code: 'TW', value: '710000', sortOrder: 34 },
      ];

      const savedProvinces = [];
      for (const province of provinces) {
        const provinceEntity = dictRepo.create({
          name: province.name,
          code: `province:${province.code}`,
          type: DictionaryType.TREE,
          parentId: chinaCountry.id,
          label: province.name,
          value: province.value,
          sortOrder: province.sortOrder,
          status: DictionaryStatus.ENABLED,
          description: `${province.name}（${province.code}）`,
          isSystem: true,
        });
        const saved = await dictRepo.save(provinceEntity);
        savedProvinces.push(saved);
      }

      // 3. 为主要省份创建主要城市
      const majorProvinces = [
        { code: 'BJ', cities: ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区'] },
        { code: 'SH', cities: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区'] },
        { code: 'GD', cities: ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市'] },
        { code: 'JS', cities: ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市'] },
        { code: 'ZJ', cities: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市'] },
        { code: 'SD', cities: ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市'] },
        { code: 'SC', cities: ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市'] },
        { code: 'HB', cities: ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市'] },
      ];

      for (const provinceInfo of majorProvinces) {
        const province = savedProvinces.find((p) => p.code === `province:${provinceInfo.code}`);
        if (province) {
          for (let i = 0; i < provinceInfo.cities.length; i++) {
            const city = provinceInfo.cities[i];
            const cityEntity = dictRepo.create({
              name: city,
              code: `city:${provinceInfo.code}:${i + 1}`,
              type: DictionaryType.TREE,
              parentId: province.id,
              label: city,
              value: `${province.value}${String(i + 1).padStart(2, '0')}`,
              sortOrder: i + 1,
              status: DictionaryStatus.ENABLED,
              description: `${city}（${province.name}）`,
              isSystem: true,
            });
            await dictRepo.save(cityEntity);
          }
        }
      }
    }

    // 4. 创建常用字典类型（非树形）
    const commonDicts = [
      {
        name: '用户状态',
        code: 'user_status',
        type: DictionaryType.DICT,
        items: [
          { label: '活跃', value: 'active' },
          { label: '未激活', value: 'inactive' },
          { label: '已禁用', value: 'banned' },
        ],
      },
      {
        name: '文章状态',
        code: 'post_status',
        type: DictionaryType.DICT,
        items: [
          { label: '草稿', value: 'draft' },
          { label: '已发布', value: 'published' },
          { label: '已归档', value: 'archived' },
        ],
      },
      {
        name: '评论状态',
        code: 'comment_status',
        type: DictionaryType.DICT,
        items: [
          { label: '待审核', value: 'pending' },
          { label: '已通过', value: 'approved' },
          { label: '已拒绝', value: 'rejected' },
        ],
      },
      {
        name: '性别',
        code: 'gender',
        type: DictionaryType.DICT,
        items: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
          { label: '未知', value: 'unknown' },
        ],
      },
      {
        name: '学历',
        code: 'education',
        type: DictionaryType.DICT,
        items: [
          { label: '小学', value: 'primary' },
          { label: '初中', value: 'junior' },
          { label: '高中', value: 'senior' },
          { label: '大专', value: 'college' },
          { label: '本科', value: 'bachelor' },
          { label: '硕士', value: 'master' },
          { label: '博士', value: 'doctor' },
        ],
      },
    ];

    for (const dictInfo of commonDicts) {
      for (const item of dictInfo.items) {
        const dictEntity = dictRepo.create({
          name: item.label,
          code: dictInfo.code,
          type: dictInfo.type,
          label: item.label,
          value: item.value,
          sortOrder: dictInfo.items.indexOf(item) + 1,
          status: DictionaryStatus.ENABLED,
          description: `${dictInfo.name} - ${item.label}`,
          isSystem: true,
        });
        await dictRepo.save(dictEntity);
      }
    }

    const totalCount = await dictRepo.count();
    console.log(`✅ 字典数据初始化完成，共创建 ${totalCount} 条记录`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  initDictionaries()
    .then(() => {
      console.log('✅ 字典初始化完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 字典初始化失败:', error);
      process.exit(1);
    });
}

export default initDictionaries;

