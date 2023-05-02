import {
  Application,
  DeclarationReflection,
  PageEvent,
  ParameterType,
  ProjectReflection,
} from 'typedoc';
import * as yaml from 'yaml';
import { FrontmatterEvent } from './events';
import { getFrontmatterTags } from './tags';

export function load(app: Application) {
  app.options.addDeclaration({
    name: 'frontmatterGlobals',
    help: '[typedoc-plugin-frontmatter] Specify static variables to be added to all frontmatter.',
    type: ParameterType.Mixed,
    defaultValue: {},
  });

  app.options.addDeclaration({
    name: 'frontmatterTags',
    help: '[typedoc-plugin-frontmatter] Specify which file comment tags should be added to frontmatter.',
    type: ParameterType.Array,
    defaultValue: [],
  });

  app.options.addDeclaration({
    name: 'frontmatterTagsToSnakeCase',
    help: '[typedoc-plugin-frontmatter] Jsdoc tags cannot be snake case. Tags by default must be camelCase',
    type: ParameterType.Boolean,
    defaultValue: false,
  });

  app.renderer.on(
    PageEvent.END,
    (page: PageEvent<ProjectReflection | DeclarationReflection>) => {
      const frontmatterGlobals = app.options.getValue(
        'frontmatterGlobals',
      ) as any;

      const frontmatterTags = app.options.getValue(
        'frontmatterTags',
      ) as string[];

      const frontmatterTagsToSnakeCase = app.options.getValue(
        'frontmatterTagsToSnakeCase',
      ) as boolean;

      const event = new FrontmatterEvent(
        FrontmatterEvent.PREPARE_FRONTMATTER,
        page,
        {
          ...frontmatterGlobals,
          ...(page.model?.comment &&
            getFrontmatterTags(
              page.model.comment,
              frontmatterTags,
              frontmatterTagsToSnakeCase,
            )),
        },
      );

      app.renderer.trigger(event);

      page.contents = page?.contents
        ?.replace(/^/, `---\n${yaml.stringify(event.frontmatter)}---\n\n`)
        .replace(/[\r\n]{3,}/g, '\n\n');
    },
  );
}

export * from './events';
