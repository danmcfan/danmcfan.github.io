import { ProfileBlock } from "../components/about/ProfileBlock";
import { SocialLinks } from "../components/about/SocialLinks";
import { socials } from "../data/socials";

export function AboutPage() {
  return (
    <section>
      <ProfileBlock
        imageSrc="/headshot.jpeg"
        name="Danny O'Brien"
        role="Software Engineer and Systems Mage"
        description="I build software that is reliable, performant, and aesthetically pleasing. I enjoy taking vague ideas, mapping the terrain, and turning them into clear systems through thoughtful architecture and steady iteration. When I'm not in my coding dungeon, you can usually find me out in the California sun surfing or rock climbing."
      >
        <SocialLinks socials={socials} />
      </ProfileBlock>
    </section>
  );
}
