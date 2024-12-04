import {headers} from 'next/headers';
import {faker} from '@faker-js/faker';
import {getPublicAppSettings} from '@/app/actions';
import {generateSignedUserData} from './actions';
import {notFound} from 'next/navigation';
import backgroundImg from '@/assets/background/bg.jpg'

// Move faker data generation outside the component
const mockUserData = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  id: faker.string.uuid(),
  email: faker.internet.email(),
};

export default async function Page({
                                     params,
                                   }: {
  params: Promise<{ orgFriendlyId: string; agentFriendlyId: string }>;
}) {
  const envPrefix = (await headers()).get('x-magi-env-prefix') ?? '';
  const {orgFriendlyId, agentFriendlyId} = await params;
  const settings = await getPublicAppSettings(orgFriendlyId, agentFriendlyId);
  const brandColor = settings?.brandColor;

  if (!orgFriendlyId || !agentFriendlyId) {
    notFound();
  }

  let signedUserData = null;

  try {
    signedUserData = await generateSignedUserData(
        mockUserData,
        orgFriendlyId,
        agentFriendlyId
    );
  } catch (error) {
    console.log('Error generating signed user data', error);
  }

  const widgetLoadPayload = {
    envPrefix,
    orgFriendlyId,
    agentFriendlyId,
    bgColor: brandColor || '#00202b',
    signedUserData: signedUserData || undefined,
  };

  return (
      <div style={{
        backgroundImage: `url(${backgroundImg.src})`,
        backgroundSize: 'cover',
        height: '100vh'
      }}>
        <script src='/js/widget.js' defer></script>
        <script
            dangerouslySetInnerHTML={{
              __html: `
    addEventListener("load", function () {
      Maven.ChatWidget.load(${JSON.stringify(widgetLoadPayload)});
    });`,
            }}
        ></script>
      </div>
  );
}
