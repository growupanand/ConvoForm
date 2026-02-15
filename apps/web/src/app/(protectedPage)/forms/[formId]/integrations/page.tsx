import FormIntegrationsSettings from "./_components/formIntegrationsSettings";

type Props = {
  params: Promise<{ formId: string }>;
};

export default async function IntegrationsPage(props: Props) {
  const params = await props.params;
  const { formId } = params;

  return (
    <div className="p-6">
      <FormIntegrationsSettings formId={formId} />
    </div>
  );
}
