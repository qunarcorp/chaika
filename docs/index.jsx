---
banner:
  name: 'Nanachi 拆包合并工具'
  desc: '通过chaika, 将要上线的频道整合成一个要上线的小程序，集中用nanachi进行转译发布'
  btns: 
    - { name: '开 始', href: './documents/index.html', primary: true }
  caption: '当前版本: v0.0.4'
features: 
    - { name: '解耦', desc: '业务解耦合, 可以更灵活的实现业务效果, 多业务线开发互不干扰' }
    - { name: '体验', desc: '我们为开发者提供简洁的命令、合理的开发流程，以追求更舒适的开发体验' }

footer:
  copyRight:
    name: 'YMFE Team'
    href: 'https://ymfe.org/'
  links:
    团队网址:
      - { name: 'YMFE', href: 'https://ymfe.org/' }
      - { name: 'YMFE Blog', href: 'https://blog.ymfe.org/' }
    Git仓库:
      - { name: 'Github', href: 'https://github.com/YMFE/ydoc' }
      - { name: 'Github Issue', href: 'https://github.com/YMFE/ydoc/issues' }

---

<Homepage banner={banner} features={features} />
<Footer distPath={props.page.distPath} copyRight={props.footer.copyRight} links={props.footer.links} />